import { assetUrl } from '../assetUrl'

interface PaperSheetProps {
  paperRef: React.RefObject<HTMLDivElement | null>
}

export default function PaperSheet({ paperRef }: PaperSheetProps) {
  return (
    <div className="paper-sheet-wrap">
      <div className="paper-sheet" ref={paperRef}>
        <img
          src={assetUrl('assets/shared/page-front.png')}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
    </div>
  )
}
