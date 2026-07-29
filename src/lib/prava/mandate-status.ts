import { MandateStatus } from "@/generated/prisma/enums";
import type { PravaMandateStatus } from "./types";

const MAP: Record<PravaMandateStatus, MandateStatus> = {
  pending: MandateStatus.PENDING,
  active: MandateStatus.ACTIVE,
  paused: MandateStatus.PAUSED,
  consumed: MandateStatus.CONSUMED,
  cancelled: MandateStatus.CANCELLED,
  expired: MandateStatus.EXPIRED,
};

export function toMandateStatus(status: PravaMandateStatus): MandateStatus {
  return MAP[status] ?? MandateStatus.PENDING;
}
