"use client";

import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Input from "./Input";

const StrategicCallModal = ({ isOpen, onClose }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
  });

  const onChangeFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    const { fullName, emailAddress, phoneNumber } = formData;

    if (!fullName || !emailAddress || !phoneNumber) return;
    if (!emailRegex.test(emailAddress)) return;

    if (recaptchaSiteKey && !captchaToken) {
      alert("Please verify that you are not a robot.");
      return;
    }

    setLoading(true);
    setSubmitted(false);

    try {
      const res = await fetch("/api/strategy-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
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

      // Reset form but keep modal open to show success message
      setFormData({
        fullName: "",
        emailAddress: "",
        phoneNumber: "",
      });
      setCaptchaToken(null);
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
        className={`relative bg-white shadow-lg z-10 animate-fadeIn
          ${submitted ? "w-[85%] sm:w-[380px] md:w-[680px]" : "w-[90%] sm:w-[480px] md:w-[620px] lg:w-[680px]"}
          max-h-[90vh] overflow-y-auto overflow-x-hidden
          p-[24px] sm:p-[35px] md:p-[30px]
        `}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        {submitted ? (
          <div className="flex flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-4 py-4">
            <h3 className="text-[28px] sm:text-[32px] font-semibold text-[#34393E]">
              Thank you!
            </h3>
            <p className="text-[18px] sm:text-[28px] leading-[150%] text-[#34393E]">
              Look forward to a confirmation email in your inbox.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-[24px] sm:text-[28px] md:text-[32px] leading-[120%] tracking-tight text-[#34393E] font-[550]">
              Turn Digital Inclusion Into Measurable Market Growth
            </h3>
            <p className="my-6 text-[26px] leading-[120%] text-[#34393E]">
              Book a Strategic Discovery Call
            </p>

            <form className="mt-[28px] space-y-[28px]" onSubmit={onSubmitForm}>
              <Input
                label="FULL NAME"
                value={formData.fullName}
                inputname="fullName"
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
                type="tel"
                label="PHONE NUMBER"
                value={formData.phoneNumber}
                inputname="phoneNumber"
                onChange={onChangeFormData}
              />

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
                disabled={loading}
                className={`
                  w-full h-[60px] sm:h-[72px]
                  text-[18px] font-medium transition-all
                  ${
                    loading
                      ? "bg-[#34393E] animate-pulse"
                      : "bg-[#1D2328] hover:bg-[#34393E]"
                  }
                  text-white
                `}
              >
                {loading ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default StrategicCallModal;


