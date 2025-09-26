import { Apartment } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { pb } from "./client";

export type Gate = {
  id: string;
  complex_id: string;
  name: string;
  type: "GATE" | "BARRIER" | string;
}

export const useGates = (apartment?: Apartment) => useQuery({
  queryKey: ['gates', apartment?.id],
  queryFn: () => {
    return pb.collection('gates').getFullList<Gate>({
      filter: `complex_id="${apartment?.complex_id}"`
    });
  },
  enabled: !!apartment // Запрос выполнится только когда apartment будет доступен
})