// // realtime-chat-backend/controllers/agoraController.js
// const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

// exports.getToken = (req, res) => {
//   try {
//     const appId = process.env.AGORA_APP_ID;
//     const appCertificate = process.env.AGORA_APP_CERTIFICATE;
//     const channelName = req.query.channel;
//     const uid = req.query.uid || 0; // use numeric uid or 0 for dynamic uid
//     if (!appId || !appCertificate || !channelName) {
//       return res.status(400).json({ msg: "Missing required parameters" });
//     }
//     const role = RtcRole.PUBLISHER;
//     const expireTimeSeconds = 3600; // 1 hour for dev
//     const currentTimestamp = Math.floor(Date.now() / 1000);
//     const privilegeExpireTs = currentTimestamp + expireTimeSeconds;

//     const token = RtcTokenBuilder.buildTokenWithUid(
//       appId,
//       appCertificate,
//       channelName,
//       Number(uid),
//       role,
//       privilegeExpireTs
//     );
//     res.json({ token, appId });
//   } catch (err) {
//     console.error("Failed to build Agora token", err);
//     res.status(500).json({ msg: "Server error creating token" });
//   }
// };
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

exports.getToken = (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = req.query.channel;

    // FIX: The user ID from the query is a string. For token generation that
    // needs a number, it's safer and more flexible to use a UID of 0.
    // A token generated with UID 0 can be used by any user to join the channel.
    // The client will still join with their unique string ID.
    const uid = 0;

    if (!appId || !appCertificate || !channelName) {
      console.error("!!! ERROR: Missing required parameters for token generation.");
      return res.status(400).json({ msg: "Missing required parameters" });
    }
    
    const role = RtcRole.PUBLISHER;
    const expireTimeSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTimestamp + expireTimeSeconds;

    console.log("--- Generating Agora Token ---");
    console.log("Using App ID:", appId ? "Loaded" : "!!! MISSING !!!");
    console.log("Using App Certificate:", appCertificate ? "Loaded" : "!!! MISSING !!!");
    console.log("For Channel Name:", channelName);
    console.log("Token UID:", uid);

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid, // Use the corrected UID
      role,
      privilegeExpireTs
    );
    
    console.log("Token generated successfully.");
    res.json({ token, appId });

  } catch (err) {
    console.error("!!! CRITICAL ERROR: Failed to build Agora token", err);
    res.status(500).json({ msg: "Server error creating token" });
  }
};
