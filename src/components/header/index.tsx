import s from "./styles.module.css"
import { MainNav } from "./navigation"
import Link from "@/components/link"

export default function Header() {
  return (
    <header className={s.header}>
      <h1>Prometheus</h1>
      <MainNav />
      <Link href={"/account"}>Account</Link>
    </header>
  )
}
