import * as NavigationMenu from "@radix-ui/react-navigation-menu"
import Link from "@/components/link"
import s from "./styles.module.css"

export function MainNav() {
  return (
    <NavigationMenu.Root className={s.mainNav}>
      <NavigationMenu.List className={s.navList}>
        <NavigationMenu.Item className={s.navItem}>
          <NavigationMenu.Link asChild>
            <Link href={"/"} className={s.navLink}>
              Home
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item className={s.navItem}>
          <NavigationMenu.Link asChild>
            <Link href={"/movies"} className={s.navLink}>
              Movies
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item className={s.navItem}>
          <NavigationMenu.Link asChild>
            <Link href={"/series"} className={s.navLink}>
              Series
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item className={s.navItem}>
          <NavigationMenu.Link asChild>
            <Link href={"/tv"} className={s.navLink}>
              Live TV
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
