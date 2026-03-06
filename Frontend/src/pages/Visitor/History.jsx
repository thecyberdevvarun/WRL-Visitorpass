import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CgProfile } from "react-icons/cg";
import {
  FaEye,
  FaUsers,
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaClock,
  FaRedo,
} from "react-icons/fa";
import { MdHistory, MdFilterList } from "react-icons/md";
import { baseURL } from "../../assets/assets";
import { formatISODateString } from "../../utils/dateUtils";

/* ==================== Dashboard-Style Stat Card ==================== */
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900 rounded-lg p-4 flex items-center transition-colors duration-300">
    <div className={`mr-4 p-3 rounded-full ${color}`}>
      <Icon className="text-white text-2xl" />
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {value}
      </h2>
    </div>
  </div>
);

const History = () => {
  const [allVisitors, setAllVisitors] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitLogs, setVisitLogs] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch visitors from backend
  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const params = { limit, offset };
      const res = await axios.get(`${baseURL}visitor/history`, { params });
      if (res.data?.success) {
        setAllVisitors(res.data.data || []);
        setVisitors(res.data.data || []);
        setTotalCount(res.data.data?.length || 0);
      } else {
        toast.error(res.data?.message || "Failed to fetch visitors");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch visitors");
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side search and date filters
  const applyFilters = () => {
    let filtered = [...allVisitors];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.visitor_name?.toLowerCase().includes(searchLower) ||
          v.company?.toLowerCase().includes(searchLower),
      );
    }

    if (from) {
      filtered = filtered.filter(
        (v) => new Date(v.check_in_time) >= new Date(from + "T00:00:00"),
      );
    }
    if (to) {
      filtered = filtered.filter(
        (v) => new Date(v.check_in_time) <= new Date(to + "T23:59:59"),
      );
    }

    setVisitors(filtered);
    setTotalCount(filtered.length);
  };

  useEffect(() => {
    applyFilters();
  }, [search, from, to, allVisitors]);

  useEffect(() => {
    fetchVisitors();
  }, [limit, offset]);

  const openDetails = async (visitor) => {
    setSelectedVisitor(visitor);
    setDetailLoading(true);
    try {
      const res = await axios.get(`${baseURL}visitor/details/${visitor.id}`);
      if (res.data?.success) {
        setVisitLogs(res.data.visit_logs || []);
      } else {
        toast.error(res.data?.message || "Failed to fetch visitor details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch visitor details");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedVisitor(null);
    setVisitLogs([]);
  };

  // Computed stats
  const uniqueCompanies = [
    ...new Set(visitors.map((v) => v.company).filter(Boolean)),
  ].length;

  const totalPasses = visitors.reduce(
    (acc, v) => acc + (v.total_passes ?? 0),
    0,
  );

  // Current page info
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 max-w-full transition-colors duration-300">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">
        Visitor History
      </h1>

      {/* ==================== Stats Cards ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FaUsers}
          title="Total Visitors"
          value={totalCount}
          color="bg-blue-500"
        />
        <StatCard
          icon={MdHistory}
          title="Total Visits"
          value={totalPasses}
          color="bg-green-500"
        />
        <StatCard
          icon={FaBuilding}
          title="Companies"
          value={uniqueCompanies}
          color="bg-purple-500"
        />
        <StatCard
          icon={FaSearch}
          title="Showing"
          value={`${visitors.length} of ${allVisitors.length}`}
          color="bg-red-500"
        />
      </div>

      {/* ==================== Filters Section ==================== */}
      <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900 rounded-lg p-6 mb-6 transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
          <MdFilterList className="text-blue-500 dark:text-blue-400" /> Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs" />
              <input
                type="text"
                placeholder="Search by Name or Company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                  transition-colors duration-300"
              />
            </div>
          </div>

          {/* From Date */}
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                transition-colors duration-300"
            />
          </div>

          {/* To Date */}
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                transition-colors duration-300"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
            >
              <FaSearch className="text-xs" /> Apply
            </button>
            <button
              onClick={() => {
                setSearch("");
                setFrom("");
                setTo("");
                setOffset(0);
                fetchVisitors();
              }}
              className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-500 dark:hover:bg-gray-500 transition cursor-pointer flex items-center gap-1"
            >
              <FaRedo className="text-xs" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ==================== Visitors Table ==================== */}
      <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900 rounded-lg p-6 transition-colors duration-300">
        {/* Table Header with Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Visitor Records
          </h3>

          <div className="flex items-center gap-4">
            {/* Per Page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Per page:
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setOffset(0);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-1.5 text-sm 
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                  transition-colors duration-300"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => offset > 0 && setOffset(offset - limit)}
                disabled={offset === 0}
                className={`p-2 rounded-lg text-sm transition ${
                  offset > 0
                    ? "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaChevronLeft />
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  offset + limit < totalCount && setOffset(offset + limit)
                }
                disabled={offset + limit >= totalCount}
                className={`p-2 rounded-lg text-sm transition ${
                  offset + limit < totalCount
                    ? "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 dark:border-blue-400 rounded-full mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
              Loading visitor history...
            </p>
          </div>
        ) : visitors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Visitor
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Company
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Last Visited
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Employee
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Department
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Total Visits
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, index) => (
                  <tr
                    key={v.id || index}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    {/* Visitor Name + Photo */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {v.photo_url ? (
                          <img
                            src={v.photo_url}
                            alt={v.visitor_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 dark:border-blue-500"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center border-2 border-gray-300 dark:border-gray-500">
                            <CgProfile className="text-xl text-gray-400 dark:text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {v.visitor_name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {v.contact_no || "No contact"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {v.company || "—"}
                    </td>

                    {/* Last Visit */}
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {formatISODateString(v.check_in_time) || "—"}
                    </td>

                    {/* Employee */}
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {v.employee_name || "—"}
                    </td>

                    {/* Department */}
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {v.department_name || "—"}
                    </td>

                    {/* Total Visits */}
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-xs px-2.5 py-1 rounded-full">
                        {v.total_passes ?? 0}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openDetails(v)}
                        className="px-3 py-1.5 bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <FaEye /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <FaUsers className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">
              No visitors found
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Try adjusting your search or date filters
            </p>
          </div>
        )}

        {/* Bottom Pagination Info */}
        {visitors.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Showing {offset + 1}–{Math.min(offset + limit, totalCount)} of{" "}
              {totalCount} visitors
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}
      </div>

      {/* ==================== Visitor Detail Modal ==================== */}
      {selectedVisitor && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-gray-950 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Visitor Details
              </h2>
              <button
                onClick={closeModal}
                className="p-2 bg-red-500 dark:bg-red-600 text-white rounded-full shadow-md hover:bg-red-600 dark:hover:bg-red-700 transition cursor-pointer"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="p-6">
              {/* Visitor Profile Card */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6 transition-colors duration-300">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Photo */}
                  {selectedVisitor.photo_url ? (
                    <img
                      src={selectedVisitor.photo_url}
                      alt="photo"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-300 dark:border-blue-500 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-4 border-gray-300 dark:border-gray-500 shadow-md">
                      <CgProfile className="text-4xl text-gray-400 dark:text-gray-300" />
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                      {selectedVisitor.visitor_name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaPhone className="text-blue-500 dark:text-blue-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Contact:
                        </span>
                        <span>{selectedVisitor.contact_no || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaBuilding className="text-purple-500 dark:text-purple-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Company:
                        </span>
                        <span>{selectedVisitor.company || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaEnvelope className="text-green-500 dark:text-green-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Email:
                        </span>
                        <span>{selectedVisitor.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaIdCard className="text-red-500 dark:text-red-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Total Visits:
                        </span>
                        <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-xs px-2.5 py-0.5 rounded-full">
                          {selectedVisitor.total_passes ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visit History Timeline */}
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                <FaClock className="text-blue-500 dark:text-blue-400" /> Visit
                Timeline
              </h3>

              {detailLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 rounded-full mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                    Loading visits...
                  </p>
                </div>
              ) : visitLogs.length === 0 ? (
                <div className="text-center py-8">
                  <MdHistory className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No visit logs found.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800"></div>

                  <div className="space-y-4">
                    {visitLogs.map((log, index) => (
                      <div
                        key={log.pass_id + log.check_in_time}
                        className="relative pl-14"
                      >
                        {/* Timeline Dot */}
                        <div
                          className={`absolute left-4 top-4 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 shadow-md ${
                            !log.check_out_time ? "bg-green-500" : "bg-blue-500"
                          }`}
                        ></div>

                        {/* Visit Card */}
                        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-4 hover:shadow-md transition-all duration-200">
                          {/* Top Row */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white bg-blue-500 dark:bg-blue-600 px-2 py-0.5 rounded-full">
                                #{visitLogs.length - index}
                              </span>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatISODateString(log.check_in_time) ||
                                  "N/A"}
                              </span>
                            </div>

                            {log.check_out_time ? (
                              <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium">
                                Out: {formatISODateString(log.check_out_time)}
                              </span>
                            ) : (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-bold">
                                Currently In
                              </span>
                            )}
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-gray-400 dark:text-gray-500 text-xs">
                                Employee
                              </p>
                              <p className="text-gray-700 dark:text-gray-300 font-medium">
                                {log.employee_name || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 dark:text-gray-500 text-xs">
                                Department
                              </p>
                              <p className="text-gray-700 dark:text-gray-300 font-medium">
                                {log.department_name || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 dark:text-gray-500 text-xs">
                                Purpose
                              </p>
                              <p className="text-gray-700 dark:text-gray-300 font-medium">
                                {log.purpose_of_visit || "—"}
                              </p>
                            </div>
                          </div>

                          {/* Token & Notes */}
                          {(log.token || log.other_notes) && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 flex flex-wrap gap-4 text-sm">
                              {log.token && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-600 dark:text-gray-300">
                                    Token:
                                  </span>{" "}
                                  {log.token}
                                </span>
                              )}
                              {log.other_notes && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-600 dark:text-gray-300">
                                    Notes:
                                  </span>{" "}
                                  {log.other_notes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
