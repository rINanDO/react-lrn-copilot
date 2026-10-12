import type { Kop } from "../../api";

export function processKopTitle(kop: Kop|undefined): string {
    return `${kop?.label?.join(" ")} ${kop?.nr?.map((nr) => nr.text?.join(" ")).join(" ")}. ${kop?.titel?.[0]?.text?.join(" ")}`.trim();
}
