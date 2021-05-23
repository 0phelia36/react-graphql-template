
import { AdminWebsocket, AppWebsocket } from '@holochain/conductor-api';

const DEFAULT_TIMEOUT = 9999

const HREF_PORT = window.location.port
var ADMIN_PORT = 1234
var APP_ID = 'notes'
var APP_PORT = 8080 + 800
export var NETWORK_ID = ''

// No HREF PORT when run by Electron
// Use different values when in electron
if (HREF_PORT === "") {
  APP_ID = 'snapmail-app'
  ADMIN_PORT = 1235
  let searchParams = new URLSearchParams(window.location.search);
  APP_PORT = searchParams.get("APP");
  NETWORK_ID = searchParams.get("UID");
  console.log({APP_ID})
}

const ADMIN_URL = `ws://localhost:${ADMIN_PORT}`
const APP_URL =`ws://localhost:${APP_PORT}`

var g_adminWs = undefined
var g_cellId = undefined
var g_appClient = undefined

/**
 *
 */
export async function rsmConnectAdmin() {
  g_adminWs = await AdminWebsocket.connect(ADMIN_URL, DEFAULT_TIMEOUT)
  console.log('*** Connected to RSM Admin: ' + JSON.stringify(g_adminWs))
  // g_adminWs.generateAgentPubKey().then((newKey) => {
  //     g_newKey = newKey
  //     console.log({newKey})
  //     printAdmin()
  // })
}

/**
 *
 */
export async function rsmConnectApp(signalCallback) {
  let env = window.location;
  const installed_app_id = NETWORK_ID !== '' ? APP_ID + '-' + NETWORK_ID : APP_ID;
  console.log(env);
  console.log('*** Connecting to Snapmail app at ' + APP_URL + ' ...')
  g_appClient = await AppWebsocket.connect(APP_URL, DEFAULT_TIMEOUT, signalCallback);
  console.log('*** Connected to Snapmail app: ' + JSON.stringify(g_appClient));
  const appInfo = await g_appClient.appInfo({ installed_app_id }, 1000);
  console.log({appInfo})
  if (appInfo === null) {
    alert("happ not installed in conductor: " + installed_app_id)
  }
  g_cellId = appInfo.cell_data[0].cell_id;
  // for (const cell of appInfo.cell_data) {
  //   console.log({cell})
  //   if (cell.cell_nick === NETWORK_ID) {
  //     g_cellId = cell.cell_id;
  //   }
  // }
  if (g_cellId === undefined) {
    console.error('Failed to find cell with NETWORK_ID = ' + NETWORK_ID);
    throw 'Failed to find cell with NETWORK_ID';
  }
  console.log({g_cellId})
  await dumpState(g_cellId)
  return g_cellId;
}

/**
 *
 */
const printAdmin = () => {
  console.log("printAdmin:")
  g_adminWs.listDnas().then((dnaList) => {
    console.log({dnaList})
  })
  g_adminWs.listCellIds().then((cellList) => {
    console.log({cellList})
  })
  g_adminWs.listActiveApps().then((appList) => {
    console.log({appList})
  })
}

/**
 *
 */
const dumpState = async (cellId) => {
  if (g_adminWs === undefined) {
    console.log('dumpState() Error: g_adminWs undefined')
    //resolve()
    return
  }
  const stateDump = await g_adminWs.dumpState({cell_id: cellId})
  console.log('stateDump of cell:')
  console.log({stateDump})
}

/**
 *
 * @returns {Promise<any>}
 */
export async function callDna(zomeName, functionName, payload, timeout) {
    if (g_appClient === undefined) {
      console.error("App Client Websocket not connected!")
      return Promise.reject("App Client Websocket not connected!")
    }
    const t = timeout !== undefined? timeout : DEFAULT_TIMEOUT;
    console.log("*** callDna() => " + functionName + '() ; timeout = ' + t)
  let result = undefined;
  try
  {
    result = await g_appClient.callZome({
        cap: null,
        cell_id: g_cellId,
        zome_name: zomeName,
        fn_name: functionName,
        provenance: g_cellId[1],
        payload: payload
      },
      t
    )
  } catch(err) {
    console.error("*** callDna() => " + functionName + '() failed:')
    console.error({err})
    // FIXME: Put back when Holochain connection problems are resolved
    // alert("Holochain failed.\n Connection to holochain might be lost. Reload App or refresh web page to attempt reconnection");
    return Promise.reject("callZome() failed. Possibility lost connection to holochain.")
  }
  console.log("*** callDna() => " + functionName + '() result:')
  console.log({result})
  return result;
}

export function parseZomeCallPath (zomeCallPath) {
  const [zomeFunc, zome, instanceId] = zomeCallPath.split('/').reverse()

  return { instanceId, zome, zomeFunc }
}

export function createZomeCall (zomeCallPath, callOpts = {}) {
  const { instanceId, zome, zomeFunc } = parseZomeCallPath(zomeCallPath)
  return callDna(zome, zomeFunc, callOpts)
}
