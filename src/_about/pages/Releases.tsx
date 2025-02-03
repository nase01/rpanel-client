import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import { useGetReleases } from "@/lib/react-query/queries";
import { GITHUB_CLIENT_REPO } from "@/lib/utils";
import Loader2 from "@/components/shared/Loader2";
import { Release } from "@/types";

const releases = () => {
	const { data: releases, isLoading: isFetchingReleases } = useGetReleases(GITHUB_CLIENT_REPO);
	
	if (isFetchingReleases) return <Loader2 />;
  return (
    <div className="grid lg:grid-cols-6 gap-5">
			<div className="col-span-2">
				<h1 className="text-xl font-bold">App Version Release</h1>
				{releases?.map((release: Release, index: number) => {
          const formattedBody = release.body
            .split("\r\n")
            .map((line) => (line.startsWith("-") ? `<li>${line.substring(1).trim()}</li>` : line))
            .join("");

          return (
            <div className="mt-5" key={index}>
              <h3>
                <span className="text-main font-bold italic">{release.tag}</span> -{" "}
                {new Date(release.published_at).toLocaleDateString()}
              </h3>
              <h3 className="mt-2">Release Notes:</h3>
              <ul className="ml-10 mt-2 list-disc text-gray-500" dangerouslySetInnerHTML={{ __html: formattedBody }} />
            </div>
          );
        })}
				<div className="mt-10">
					<Button size="sm" onClick={() => window.history.back()}>
						<ArrowLeftCircle className="mr-2" size={16} /> Back
					</Button>
				</div	>
			</div>
    </div>
  )
}

export default releases