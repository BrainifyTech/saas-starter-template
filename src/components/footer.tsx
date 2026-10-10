import { applicationName } from "@/app-config";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function Footer() {
  return (
    <>
      <footer className="border-t bg-neutral-100 dark:bg-background">
        <div className="max-w-screen-xl p-4 py-6 mx-auto lg:py-16 md:p-8 lg:p-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-3">
            <div>
              <h3 className="mb-6 text-sm font-semibold text-neutral-900 uppercase dark:text-foreground">
                Company
              </h3>
            </div>
            <div>
              <h3 className="mb-6 text-sm font-semibold text-neutral-900 uppercase dark:text-foreground">
                Help center
              </h3>
            </div>
            <div>
              <h3 className="mb-6 text-sm font-semibold text-neutral-900 uppercase dark:text-foreground">
                Legal
              </h3>
              <ul className="text-neutral-500 dark:text-neutral-400">
                <li className="mb-4">
                  <Link href="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/terms-of-service" className="hover:underline">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <ModeToggle />
          </div>
        </div>
      </footer>
      <footer className="py-8 px-5 border-t">
        <div className="text-center">
          <span className="block text-sm text-center text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} <Link href="/">{applicationName}</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
