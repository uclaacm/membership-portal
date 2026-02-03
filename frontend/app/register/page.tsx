/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import { FormEvent, useState } from "react";
// import { useAtomValue } from "jotai";

import registerUser from "@/app/actions/auth/registerUser";
import Banner from "@/components/Banner";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
// import { authUserProfileAtom } from "@/lib/atoms";
import Config from "@/lib/config";
import Link from "next/link";

// interface RegisterProfile {
//   year: number;
//   major: string;
// }

export default function RegisterPage() {
  const [currentPage, setCurrentPage] = useState<"details" | "success">("details");
  const [disableForm, setDisableForm] = useState(false);
  // const [profile, setProfile] = useState<RegisterProfile>({
  //   year: 0,
  //   major: "",
  // });

  const [major, setMajor] = useState<string>("");
  const [year, setYear] = useState<number>(0);

  const isValidProfile = (): boolean =>
    !!(major && !Number.isNaN(parseInt(year.toString(), 10)) && parseInt(year.toString(), 10) > 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (disableForm) return;
    if (!isValidProfile()) return;

    setDisableForm(true);

    const success = await registerUser({
      major,
      year,
    });

    if (success) {
      setCurrentPage("success");
    }

    // setDisableForm(false);
  }

  return (
    <div>
      {/* <BannerMessage showing={created && !createSuccess} success={false} message={createError} /> */}
      <div className="flex h-screen w-screen overflow-hidden fixed top-0 left-0">
        {currentPage === "details" ? (
          <div className="relative flex justify-center items-center bg-white h-full text-black text-xs w-2/5 max-w-[750px] min-w-[400px] max-[500px]:w-full">
            <div className="absolute top-0 left-0 w-full h-[30%] min-[500px]:hidden">
              <Banner decorative />
            </div>
            <div
              className={`mt-12 md:mt-0 bg-white p-[50px_50px] flex flex-col self-start w-3/4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]`}>
              <Logo pic="/acm_wordmark_chapter.svg" />
              <h1 className="text-[2rem] font-semibold mb-4">Complete Registration</h1>

              <form onSubmit={onSubmit} autoComplete="off" className="flex flex-col w-full">
                <div className="mb-4 text-left">
                  <label className="block mb-2 text-[0.9rem] font-medium text-gray3" htmlFor="major-select">
                    Major
                  </label>
                  <select
                    className="w-full p-3 border border-solid border-gray2 rounded-md text-[1rem] bg-white transition duration-200 focus:outline-none focus:border-acm-cobalt"
                    name="major"
                    id="major-select"
                    onChange={e => setMajor(e.target.value)}
                    value={major}>
                    <option value="">--</option>
                    {Config.majors.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 text-left">
                  <label className="block mb-2 text-[0.9rem] font-medium text-gray3" htmlFor="year">
                    Year
                  </label>
                  <select
                    className="w-full p-3 border border-solid border-gray2 rounded-md text-[1rem] bg-white transition duration-200 focus:outline-none focus:border-acm-cobalt"
                    name="year"
                    onChange={e => setYear(Number(e.target.value))}
                    value={year}>
                    <option value={0}>--</option>
                    <option value={1}>Freshman</option>
                    <option value={2}>Sophomore</option>
                    <option value={3}>Junior</option>
                    <option value={4}>Senior</option>
                    <option value={5}>Post-Senior</option>
                  </select>
                </div>

                <div className="mt-4 w-full">
                  <Button
                    className="w-full flex justify-center"
                    loading={disableForm}
                    style={isValidProfile() ? "green" : "disabled"}
                    text="Complete Registration"
                    action={(e: FormEvent) => onSubmit(e)}
                  />
                </div>
              </form>

              <Link className="text-acm-cobalt decoration-0 font-medium text-[0.8rem] mt-12 flex items-center" href="/">
                Back to login
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={`mt-12 md:mt-0 bg-white p-[50px_50px] flex flex-col self-start w-3/4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"`}>
            <div className="absolute top-0 left-0 w-full h-[30%] min-[500px]:hidden">
              <Banner decorative />
            </div>
            <div className="bg-white p-[50px_50px] flex flex-col [align-items:start] font-[-apple-system,BlinkMacSystemFont,sans-serif] max-[800px]:mt-12">
              <Logo pic="/acm_wordmark_chapter.svg" />
              <h1 className="text-[2rem] font-semibold h-16">Registration Complete</h1>
              <p className="text-[1rem] text-gray3 mb-4 leading-[1.75]">
                You&apos;re a member of {Config.organization.shortName} now! You can now access all member resources and
                benefits.
              </p>

              <div className="text-center self-center w-full">
                <Link href="/events">
                  <Button
                    className="m-[1.5rem_0] w-full flex justify-center text-center self-center"
                    // eslint-disable-next-line react/style-prop-object
                    style="green"
                    icon="fa fa-check"
                    text="Continue to Dashboard"
                  />
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="h-full w-3/5 flex-1 bg-primaryblue max-[500px]:hidden">
          <Banner decorative={false} />
        </div>
      </div>
    </div>
  );
}
