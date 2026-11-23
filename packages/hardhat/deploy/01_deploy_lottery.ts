import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const lottery = await env.deploy("Lottery", {
      account: deployer,
      artifact: artifacts.Lottery,
      args: [],
    });

    const owner = await env.read(lottery, { functionName: "owner" });
    console.log("Lottery deployed, owner:", owner);
  },
  { tags: ["Lottery"] },
);
