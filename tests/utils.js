import fs from "fs";
import { ClientFunction } from "testcafe";
const {
  postSnapshot,
  agentJsFilename
} = require("@percy/agent/dist/utils/sdk-utils");

export async function percySnapshot(snapshotName, snapshotOptions) {
  let getURL = ClientFunction(() => window.location.href);
  // Inject the JS that captures and serializes the DOM
  let agentFileContents = fs.readFileSync(agentJsFilename()).toString();
  let loadScriptFile = ClientFunction(
    () => {
      var script = document.createElement("script");

      script.text = agentFileContents;
      document.body.append(script);

      return true;
    },
    { dependencies: { agentFileContents: agentFileContents } }
  );

  let getDOMSnapshot = ClientFunction(
    () => {
      let percyAgentClient = new PercyAgent({
        handleAgentCommunication: false
      });

      return percyAgentClient.snapshot(snapshotName, snapshotOptions);
    },
    {
      dependencies: {
        snapshotName: snapshotName,
        snapshotOptions: snapshotOptions
      }
    }
  );

  await loadScriptFile();
  let url = await getURL();
  // Get the serialized DOM from the browser
  let domSnapshot = await getDOMSnapshot();
  // Send it off to `@percy/agent` for asset discovery
  await postDomSnapshot(snapshotName, domSnapshot, url, snapshotOptions);
}

async function postDomSnapshot(name, domSnapshot, url, options) {
  let postSuccess = await postSnapshot({
    url,
    name,
    domSnapshot,
    clientInfo: clientInfo(),
    environmentInfo: environmentInfo(),
    ...options
  });

  if (!postSuccess) {
    console.log(`[percy] Error posting snapshot to agent`);
  }
}

function clientInfo() {
  // TODO pass a version of the SDK
  return "@percy/testcafe";
}

function environmentInfo() {
  // TODO pass a version of testcafe
  return "testcafe";
}
