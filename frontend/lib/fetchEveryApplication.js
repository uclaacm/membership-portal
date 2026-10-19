import fetchAllApplications from "@/app/actions/internship/fetchAllApplications";

// The applications endpoint is paginated, so walk every page matching the given filters.
export default async function fetchEveryApplication(filters) {
  const applications = [];
  let currentPage = 1;
  let totalPages = 1;
  do {
    const result = await fetchAllApplications({ ...filters, limit: 100, page: currentPage });
    if (!result.success) throw new Error(result.error);
    applications.push(...result.data);
    totalPages = result.pagination.pages;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return applications;
}
