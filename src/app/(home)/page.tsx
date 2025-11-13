import Image from "next/image"
import s from "./styles.module.css"
import { ReactQueryProvider } from "@/client/query/Provider"
import { prefetchSeriesBatch } from "@/server/query/prefetch"
import HomeClient from "./home.client"
import { getSeriesRaw } from "@/server/series" // for fallback when prefetch fails or oversized
import type { DehydratedState } from "@tanstack/react-query"

const CATEGORIES = ["10080"]
// const CATEGORIES = ["X"]

const dehydrated: DehydratedState | null = await (async () => {
  try {
    // Prefetch only if payload expected to be reasonably small (<2MB)
    // For oversized categories skip hydration to avoid unstable_cache limit errors.
    const prefetchCandidate = await getSeriesRaw(CATEGORIES[0])
    const sizeEstimate = Buffer.from(JSON.stringify(prefetchCandidate)).length
    if (sizeEstimate < 1.8 * 1024 * 1024) {
      console.log("Prefetch size is within limit, proceeding with hydration")
      return await prefetchSeriesBatch(CATEGORIES)
    } else {
      console.warn(
        `Prefetch size estimate for categories [${CATEGORIES.join(
          ","
        )}] exceeds limit, skipping hydration`
      )
      // Skip hydration; client will fetch after mount.
      return null
    }
  } catch {
    console.error("Prefetch failed, falling back to client fetch")
    return null
  }
})()

export default async function Home() {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <Image
          className={s.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <ReactQueryProvider initialState={dehydrated}>
          <HomeClient categories={CATEGORIES} />
        </ReactQueryProvider>
        <div className={s.ctas}>
          <a
            className={s.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={s.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className={s.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  )
}
