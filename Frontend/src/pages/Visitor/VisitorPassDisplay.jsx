import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseURL } from "../../assets/assets";
import toast from "react-hot-toast";
import QRCode from "qrcode";

const VisitorPassDisplay = () => {
  const { passId } = useParams();
  const [passDetails, setPassDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassDetails = async () => {
      try {
        const res = await axios.get(`${baseURL}visitor/pass-details/${passId}`);
        if (res?.data?.success) {
          const data = res.data.data;

          const qrDataUrl = await QRCode.toDataURL(passId);

          setPassDetails({ ...data, qrCode: qrDataUrl });
        } else {
          toast.error("Failed to fetch pass details");
        }
      } catch (error) {
        console.error("Error fetching pass details:", error);
        toast.error("Failed to fetch pass details");
      } finally {
        setLoading(false);
      }
    };

    fetchPassDetails();
  }, [passId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 dark:border-blue-400 rounded-full mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
            Loading pass details...
          </p>
        </div>
      </div>
    );

  if (!passDetails)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No pass details found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            The pass ID may be invalid or expired
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 overflow-x-hidden max-w-full transition-colors duration-300">
      <div className="visitor-pass-print-area relative w-full max-w-full border-4 border-double border-black p-1 bg-white box-border">
        {/* QR Top Right */}
        <div className="absolute top-0 right-20">
          <img
            src={passDetails?.qrCode || "https://via.placeholder.com/100"}
            alt="QR Code"
            className="w-36 h-36 rounded-lg"
          />
        </div>

        {/* Profile Top Left */}
        <div className="absolute top-4 left-20">
          <img
            src={passDetails?.visitor_photo || "https://via.placeholder.com/80"}
            alt="Profile Pic"
            className="block w-30 h-30 object-cover"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold text-black">
            Western Refrigeration Pvt. Ltd
          </h1>
          <p className="text-xs leading-tight text-black">
            Survey No 631, 633, 634, 635, 636, 647, 654,
            <br />
            707, 726, 732, 741, 748, 752,
            <br />
            Village: Tadgam, Tal. Umargaon - 396 135,
            <br />
            Tadgam, Gujarat
          </p>
        </div>

        {/* Pass Title */}
        <div className="flex items-center justify-center">
          <h2 className="text-xl font-bold text-center text-black border-2 border-black inline-block px-4 py-1 mb-2">
            Visitor Pass
          </h2>
        </div>

        {/* Pass Details */}
        <div className="flex justify-between border-2 border-black p-4 mb-3 gap-4">
          {/* Left Column */}
          <div className="w-1/3 space-y-1 text-xs text-black">
            <div className="flex gap-2">
              <strong>Name:</strong>
              <span>{passDetails?.visitor_name}</span>
            </div>
            <div className="flex gap-2">
              <strong>Contact No:</strong>
              <span>{passDetails?.visitor_contact_no}</span>
            </div>
            <div className="flex gap-2">
              <strong>Company:</strong>
              <span>{passDetails?.company}</span>
            </div>
            <div className="flex gap-2">
              <strong>Purpose:</strong>
              <span>{passDetails?.purpose_of_visit}</span>
            </div>
          </div>

          {/* Middle Column */}
          <div className="w-1/3 space-y-1 text-xs text-black">
            <div className="flex gap-2">
              <strong>Department:</strong>
              <span>{passDetails?.department_name}</span>
            </div>
            <div className="flex gap-2">
              <strong>Employee To Meet:</strong>
              <span>{passDetails?.employee_name}</span>
            </div>
            <div className="flex gap-2">
              <strong>Valid From:</strong>
              <span>{new Date(passDetails?.allow_on).toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <strong>Valid Till:</strong>
              <span>{new Date(passDetails?.allow_till).toLocaleString()}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-1/3 space-y-1 text-xs text-black">
            <div className="flex gap-2">
              <strong>Visitor PassId:</strong>
              <span>{passId}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between text-xs text-black mt-12">
          <div className="w-1/3 text-center border-t border-black pt-1">
            Security Off.
          </div>
          <div className="w-1/3 text-center border-t border-black pt-1">
            Visitor
          </div>
          <div className="w-1/3 text-center border-t border-black pt-1">
            Emp. Visited
          </div>
        </div>

        {/* Note Section */}
        <div className="border border-dashed border-black p-2 mt-2 text-[10px] leading-tight text-black">
          <p className="font-bold">NOTE:</p>
          <ol className="list-decimal ml-4">
            <li>Return pass duly signed and timed by the employee visited.</li>
            <li>
              Entry to production department is not allowed without a valid
              permit.
            </li>
          </ol>
        </div>

        {/* Instructions Section */}
        <div className="border border-dashed border-black p-2 mt-1 text-[10px] leading-tight text-black">
          <div className="flex justify-between gap-4">
            {/* Left: Instructions block */}
            <div className="w-3/4">
              <p className="font-bold text-lg mb-1">
                Instructions for Visitors:
              </p>
              <p>
                <strong>Our Aim:</strong> To ensure safety for every visitor and
                employee.
              </p>
              <p>Safety is not just our priority — it defines our culture.</p>

              <ol className="list-decimal ml-6 mt-2 space-y-1">
                <li>
                  Always display your Visitor ID inside the plant and return it
                  at the main security gate before leaving.
                </li>
                <li>
                  Entry under the influence of alcohol or drugs is strictly
                  prohibited.
                </li>
                <li>
                  Possession or consumption of alcohol or illegal drugs is not
                  allowed on the premises.
                </li>
                <li>
                  Mobile phone use at the workplace is permitted only with prior
                  consent.
                </li>
                <li>
                  Photography without authorization is strictly prohibited.
                </li>
                <li>Smoking is not allowed anywhere inside the plant.</li>
              </ol>
            </div>

            {/* Right: Format info block */}
            <div className="text-right w-1/4">
              <p>Format No.: WRLTAD-F-SEC-24</p>
              <p>Rev. No.: 00</p>
              <p>Rev. Date: 01-09-2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button — Hidden during print */}
      <div className="flex justify-center mt-3 no-print">
        <button
          onClick={handlePrint}
          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors cursor-pointer shadow-md"
        >
          Print Pass
        </button>
      </div>

      {/* Proper Print Styles */}
      <style jsx="true">{`
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .visitor-pass-print-area,
          .visitor-pass-print-area * {
            visibility: visible;
            /* Force white background and black text for printing */
            background-color: white !important;
            color: black !important;
          }
          .visitor-pass-print-area {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VisitorPassDisplay;
