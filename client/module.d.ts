declare module '*.css' {
  const res: Record<string, string>;
  export default res;
}

declare module '*.scss' {
  const res: Record<string, string>;
  export default res;
}

declare module '*.json' {
  const res: string;
  export default res;
}

declare module '*.jpg' {
  const res: string;
  export default res;
}

declare module '*.png' {
  const res: string;
  export default res;
}

declare module '*.svg' {
  const res: string;
  export default res;
}

declare module '*.svg?component' {
  import React from 'react';
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.webp' {
  const res: string;
  export default res;
}

declare module '*.wav' {
  const res: string;
  export default res;
}

declare module '*.mp3' {
  const res: string;
  export default res;
}
