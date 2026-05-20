"use client";

import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Input from "./Input";


const ContactModal = ({ isOpen, onClose }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkBox, setCheckBox] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    emailAddress: "",
    organization: "",
  });

  const toggleCheckBox = () => setCheckBox((prev) => !prev);

  const onChangeFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    const { firstName, lastName, jobTitle, emailAddress, organization } =
      formData;

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !jobTitle ||
      !emailAddress ||
      !organization
    )
      return;

    if (!emailRegex.test(emailAddress)) return;

    if (recaptchaSiteKey && !captchaToken) {
      alert("Please verify that you are not a robot.");
      return;
    }

    setLoading(true);
    setSubmitted(false);

    try {
      const res = await fetch("/api/sendform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          agreed: checkBox,
          captchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Submission failed");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);

      // Reset form after animation
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          jobTitle: "",
          emailAddress: "",
          organization: "",
        });
        setCheckBox(false);
        setCaptchaToken(null);
      }, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      setLoading(false);
    }
  };

  // Close on ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative bg-white shadow-lg z-10 animate-fadeIn
          w-[90%] sm:w-[480px] md:w-[620px] lg:w-[816px]
          max-h-[90vh] overflow-y-auto overflow-x-hidden
          p-[24px] sm:p-[35px] md:p-[48px]
        "
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-[24px] sm:text-[28px] leading-[120%] tracking-tight text-[#34393E]">
          Fill the form below to start the conversation.
        </h3>

        <form className="mt-[28px] space-y-[28px]" onSubmit={onSubmitForm}>
          {/* Name */}
          <div className="flex flex-col md:flex-row gap-[28px]">
            <Input
              label="FIRST NAME"
              value={formData.firstName}
              inputname="firstName"
              onChange={onChangeFormData}
            />
            <Input
              label="LAST NAME"
              value={formData.lastName}
              inputname="lastName"
              onChange={onChangeFormData}
            />
          </div>

          <Input
            label="JOB TITLE"
            value={formData.jobTitle}
            inputname="jobTitle"
            onChange={onChangeFormData}
          />

          <Input
            type="email"
            label="EMAIL ADDRESS"
            value={formData.emailAddress}
            inputname="emailAddress"
            onChange={onChangeFormData}
          />

          <Input
            label="ORGANIZATION"
            value={formData.organization}
            inputname="organization"
            onChange={onChangeFormData}
          />

          {/* Agreement checkbox */}
          <div className="flex items-start gap-[10px]">
            <input
              type="checkbox"
              checked={checkBox}
              onChange={toggleCheckBox}
              className="accent-black w-[22px] h-[22px] cursor-pointer mt-[4px]"
            />
            <p className="text-[#1D2328] text-[18px] leading-[120%]">
              I agree to DODO collecting my personal information in order to
              receive updates and communications.
            </p>
          </div>

          {/* CAPTCHA */}
          {recaptchaSiteKey ? (
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
          ) : null}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || submitted}
            className={`
              w-full h-[60px] sm:h-[72px]
              text-[18px] font-medium transition-all
              ${
                submitted
                  ? "bg-slate-600"
                  : loading
                  ? "bg-[#34393E] animate-pulse"
                  : "bg-[#1D2328] hover:bg-[#34393E]"
              }
              text-white
            `}
          >
            {loading
              ? "SUBMITTING..."
              : submitted
              ? "SUBMITTED"
              : "SUBMIT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
