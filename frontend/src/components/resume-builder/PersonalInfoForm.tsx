import { useState } from "react";
import { FaLinkedin } from "react-icons/fa";
import { Input } from "../ui/FormField";
import { ResumeContent } from "../../types";

type PersonalInfo = ResumeContent["personalInfo"];

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
}

export default function PersonalInfoForm({
  personalInfo,
  onChange,
}: PersonalInfoFormProps) {
  const contact = personalInfo.contact || {};
  const address = contact.address || {};
  const [location, setLocation] = useState(
    [address.city, address.state].filter(Boolean).join(", "),
  );

  const setField = (field: keyof PersonalInfo, value: string) =>
    onChange({ ...personalInfo, [field]: value });

  const setContact = (field: keyof typeof contact, value: string) =>
    onChange({ ...personalInfo, contact: { ...contact, [field]: value } });

  const handleLocationChange = (value: string) => {
    setLocation(value);
    const [city = "", state = ""] = value.split(",").map((s) => s.trim());
    onChange({
      ...personalInfo,
      contact: {
        ...contact,
        address: { ...address, city, state },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <Input
          label="Name"
          value={personalInfo.fullName || ""}
          onChange={(e) => setField("fullName", e.target.value)}
          placeholder="John Doe"
        />
      </div>
      <div>
        <Input
          label="Job Title"
          value={personalInfo.jobTitle || ""}
          onChange={(e) => setField("jobTitle", e.target.value)}
          placeholder="Senior Software Engineer"
        />
      </div>
      <div>
        <Input
          label="Email"
          type="email"
          value={contact.email || ""}
          onChange={(e) => setContact("email", e.target.value)}
          placeholder="john@email.com"
        />
      </div>
      <div>
        <Input
          label="Phone"
          type="tel"
          value={contact.phone || ""}
          onChange={(e) => setContact("phone", e.target.value)}
          placeholder="+8801XXXXXXXXX"
        />
      </div>
      <div>
        <Input
          label="Location"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="city, state"
        />
      </div>
      <div>
        <Input
          label="LinkedIn"
          icon={<FaLinkedin size={16} />}
          value={contact.linkedIn || ""}
          onChange={(e) => setContact("linkedIn", e.target.value)}
          placeholder="username"
        />
      </div>
    </div>
  );
}
