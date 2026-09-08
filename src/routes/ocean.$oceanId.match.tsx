import { createFileRoute, redirect } from "@tanstack/react-router";
import { getOcean } from "@/data/oceans";

/** Legacy matching route — send players to the ocean's level select. */
export const Route = createFileRoute("/ocean/$oceanId/match")({
  beforeLoad: ({ params }) => {
    const ocean = getOcean(params.oceanId);
    if (!ocean) {
      throw redirect({ to: "/globe" });
    }
    throw redirect({
      to: "/ocean/$oceanId",
      params: { oceanId: ocean.id },
    });
  },
});
