import { useQuery } from "@tanstack/react-query";

type CommitResponse = {
  sha: string;
};

export function useLatestCommit() {
  return useQuery({
    queryKey: [
      "github-latest-commit",
      "baditaflorin/reaction-diffusion-patternmaker",
    ],
    queryFn: async () => {
      const response = await fetch(
        "https://api.github.com/repos/baditaflorin/reaction-diffusion-patternmaker/commits/main",
        {
          headers: { Accept: "application/vnd.github+json" },
        },
      );
      if (!response.ok) throw new Error("GitHub commit lookup failed");
      const body = (await response.json()) as CommitResponse;
      return body.sha;
    },
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
  });
}
