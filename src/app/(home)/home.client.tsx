"use client"

import { useSeriesBatch } from "@/client/query/hooks"
import s from "./styles.module.css"
import Image from "next/image"

interface Props {
  categories: string[]
}

export default function HomeClient({ categories }: Props) {
  const { data, isLoading, error } = useSeriesBatch(categories)

  return (
    <>
      <div className={s.intro}>
        <h1>To get started, edit the page.tsx file.</h1>
        <p>
          Looking for a starting point or more instructions? Head over to{" "}
          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Templates
          </a>{" "}
          or the{" "}
          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learning
          </a>{" "}
          center.
        </p>
      </div>
      {isLoading && <p>Loading series...</p>}
      {error && <p>Error loading series.</p>}
      {!isLoading && !error && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <div style={{ marginTop: 24 }}>
        <Image
          className={s.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
      </div>
    </>
  )
}
