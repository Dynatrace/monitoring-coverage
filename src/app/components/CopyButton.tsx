import { Button, showToast } from "@dynatrace/strato-components-preview"
import { CheckmarkIcon, CopyIcon } from "@dynatrace/strato-icons";
import React, { useState } from "react"

type CopyButtonProps = {
  contentToCopy: string;
}

export const CopyButton = ({ contentToCopy }: CopyButtonProps) => {
  const [copied, setCopied] = useState<boolean>();

  return <Button
    variant='emphasized'
    onClick={() => {
      navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      showToast({ title: 'Copied to clipboard', type: 'info', lifespan: 2000 })
    }}
    className='copyButton'
    color={copied ? 'success' : 'neutral'}
  >
    <Button.Prefix>{!copied ? <CopyIcon /> : <CheckmarkIcon />}</Button.Prefix>
    Copy
  </Button>
}
