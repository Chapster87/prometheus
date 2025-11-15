"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import Button from "@/components/button"
import { X } from "lucide-react"
import EpisodeRatingMatrix from "../matrix"
import { TmdbSeasonDetail } from "@/types/series"

import dialogStyles from "@/styles/components/dialog.module.css"
import s from "./styles.module.css"

export default function MatrixDialog({
  seasons,
}: {
  seasons: TmdbSeasonDetail[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button className={s.trigger} unstyled>
          Episode Rating Matrix
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogStyles.overlay} />
        <Dialog.Content className={dialogStyles.content}>
          <Dialog.Title className={dialogStyles.title}>
            Episode Rating Matrix
          </Dialog.Title>
          <Dialog.Close asChild>
            <Button aria-label="Close Dialog" className={dialogStyles.close}>
              <X />
            </Button>
          </Dialog.Close>
          <div className={dialogStyles.body}>
            <EpisodeRatingMatrix seasons={seasons} />
            <div className={dialogStyles.footer}>
              <Dialog.Close asChild>
                <Button
                  aria-label="Close Dialog"
                  className={dialogStyles.closeBottom}
                >
                  Close
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
