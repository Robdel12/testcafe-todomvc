import fs from "fs";
import { ClientFunction } from "testcafe";
const {
  agentJsFilename,
  postSnapshot
} = require("@percy/agent/dist/utils/sdk-utils");

export class Percy {
  async postDomSnapshot(name, domSnapshot, url, options) {
    const postSuccess = await postSnapshot({
      name,
      url,
      domSnapshot,
      clientInfo: clientInfo(),
      ...options
    });
    if (!postSuccess) {
      console.log(`[percy] Error posting snapshot to agent`);
    }
  }

  async percySnapshot(snapshotName, snapshotOptions) {
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

    await loadScriptFile();

    let setupPercyAndSnapshot = ClientFunction(
      () => {
        let percyAgentClient = new PercyAgent({
          clientInfo: "self-built-test-cafe",
          environmentInfo:
            "some helpful os or browser information for debugging"
        });

        percyAgentClient.snapshot(snapshotName, snapshotOptions);
      },
      {
        dependencies: {
          snapshotName: snapshotName,
          snapshotOptions: snapshotOptions
        }
      }
    );

    await setupPercyAndSnapshot();
  }
}
