import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const lotto = await env.deploy("Lotto", {
      account: deployer,
      artifact: artifacts.Lotto,
      args: [],
    });

    const owner = await env.read(lotto, { functionName: "owner" });
    console.log("Lotto deployed, owner:", owner);
  },
  { tags: ["Lotto"] },
);
