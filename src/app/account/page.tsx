import { Metadata } from "next"
import { getAccount } from "@/server/account"

export const metadata: Metadata = {
  title: "Account Information",
}

export default async function AccountPage() {
  const data = await getAccount()

  return (
    <div>
      <h1>Account Information</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
