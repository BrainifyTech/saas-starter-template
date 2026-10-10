import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <>
      <div className="flex flex-col gap-8 items-center pb-24">
        <h1 className="text-4xl mt-24">Not interested? No worries at all</h1>

        <Button variant="default" asChild size="lg">
          <Link href="/">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to the home page
          </Link>
        </Button>
      </div>
    </>
  );
}
