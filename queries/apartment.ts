import { Apartment, ResComplex } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { pb } from "./client";

export const useApartmentData = () => {
  return useQuery({
    queryKey: ['apartment_info'],
    queryFn: async () => {
      const apartment = await pb.collection<Apartment>('apartments').getFirstListItem(
        `user="${pb.authStore.record?.id}"`
      );

      const complex = await pb.collection<ResComplex>('res_complexes').getOne(apartment.complex_id)

      return {
        apartment,
        complex
      }
    }
  })
}