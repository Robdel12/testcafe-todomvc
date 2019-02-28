import fs from "fs";
import { ClientFunction } from "testcafe";
import { agentJsFilename } from "@percy/agent";

export class Percy {
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
