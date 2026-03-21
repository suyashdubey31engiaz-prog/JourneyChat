import React, { useState } from "react";

const avatars = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
];

const ProfilePic = () => {
  const [selected, setSelected] = useState(avatars[0]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelected(url);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <img src={selected} className="w-24 h-24 rounded-full object-cover" alt="profile" />
      <input type="file" onChange={handleUpload} className="text-sm text-white" />
      <div className="flex gap-2">
        {avatars.map((av) => (
          <img
            key={av}
            src={av}
            className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-primary"
            onClick={() => setSelected(av)}
            alt="avatar"
          />
        ))}
      </div>
    </div>
  );
};

export default ProfilePic;
