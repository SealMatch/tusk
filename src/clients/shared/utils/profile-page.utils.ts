export const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  }
};
