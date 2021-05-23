import { Orchestrator, Config, InstallAgentsHapps } from "@holochain/tryorama";
import path from "path";

const conductorConfig = Config.gen();

// Construct proper paths for your DNAs
const exercise = path.join(__dirname, "../../notes.dna");

// create an InstallAgentsHapps array with your DNAs to tell tryorama what
// to install into the conductor.
const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [exercise],
  ],
];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(() => resolve(null), ms));

const orchestrator = new Orchestrator();

orchestrator.registerScenario(
  "add and retrieve notes",
  async (s, t) => {
    const [alice] = await s.players([conductorConfig]);

    // install your happs into the coductors and destructuring the returned happ data using the same
    // array structure as you created in your installation array.
    const [[alice_common]] = await alice.installAgentsHapps(installation);

    let entryHash = await alice_common.cells[0].call(
      "exercise",
      "create_note",
      {
        title: "Sovereign Accountable Commons",
        content: "A Sovereign Accountable Commons (SAC) is akin to idea of a Decentralized Autonomous Organizations (DAO) on Ethereum but the underlying technology is fundamentally different, as SACs are built on Ceptr and Holochain. http://ceptr.org/projects/sovereign",
      }
    );

    t.ok(entryHash, "test add book");
      
    // add your test here
    let books = await alice_common.cells[0].call(
      "exercise", // name of zome
      "list_notes", // function to call
      undefined
    );
    t.ok(books, "test get book"); // tape test assertion
    console.log(books)
  }
);

orchestrator.run();
