import type { Toestand } from './types.gen';
import { mapElement } from './xmlToModel';

export const WETTEN_REPOSITORY_BASE_URL = 'https://repository.officiele-overheidspublicaties.nl';

export type GetToestandOptions = {
    baseUrl?: string;
    signal?: AbortSignal;
};

export function getToestandUrl(bwbId: string, expression: string, baseUrl = WETTEN_REPOSITORY_BASE_URL): string {
    const id = encodeURIComponent(bwbId);
    const expr = encodeURIComponent(expression);
    return `${baseUrl}/BWB/${id}/${expr}/xml/${id}_${expr}.xml`;
}

export function parseToestand(xml: string): Toestand {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    const parseError = document.querySelector('parsererror');
    if (parseError) {
        throw new Error(`Invalid toestand XML: ${parseError.textContent}`);
    }
    return mapElement(document.documentElement, 'Toestand') as Toestand;
}

/** Fetches a BWB toestand (e.g. `BWBR0001840`, `2023-02-22_0`) and maps it to a `Toestand`. */
export async function getToestand(
    bwbId: string,
    expression: string,
    { baseUrl, signal }: GetToestandOptions = {},
): Promise<Toestand> {
    const response = await fetch(getToestandUrl(bwbId, expression, baseUrl), {
        headers: { Accept: 'application/xml' },
        signal,
    });
    if (!response.ok) {
        throw new Error(`Fetching toestand ${bwbId} ${expression} failed: ${response.status} ${response.statusText}`);
    }
    return parseToestand(await response.text());
}
