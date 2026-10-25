import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { site } from '../site';

/*
 * Read from the project root, not import.meta.url: this module is bundled into
 * dist/.prerender during the build and the font is not copied beside it.
 * The font stays out of public/ so it is never shipped to readers.
 */
const fontPath = resolve(process.cwd(), 'src/assets/fonts/BricolageGrotesque.ttf');
let fontData: Buffer | null = null;

const font = async () => {
  fontData ??= await readFile(fontPath);
  return fontData;
};

const WIDTH = 1200;
const HEIGHT = 630;

type Card = { title: string; kicker: string; footer?: string };

/** Social card: title, topic kicker, brand footer. No gradients, no stock art. */
export const ogPng = async ({ title, kicker, footer }: Card): Promise<Buffer> => {
  const data = await font();
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#151c2b',
          padding: '64px',
          fontFamily: 'Bricolage Grotesque',
          color: '#f7f6f3',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', fontSize: 28, letterSpacing: 2, color: '#8fb0ef' },
              children: kicker.toUpperCase(),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: title.length > 70 ? 56 : 68,
                lineHeight: 1.1,
                fontWeight: 700,
                maxWidth: '950px',
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: 30,
                borderTop: '2px solid #33405c',
                paddingTop: '24px',
              },
              children: [
                { type: 'div', props: { style: { display: 'flex' }, children: site.name } },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', color: '#9aa6bd', fontSize: 24 },
                    children: footer ?? site.tagline,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Bricolage Grotesque', data, weight: 700, style: 'normal' }],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return Buffer.from(resvg.render().asPng());
};
