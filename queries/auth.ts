import { useQuery } from "@tanstack/react-query";
import { pb } from "./client";

export const useAuth = () => useQuery({
  queryKey: ['auth'],
  queryFn: () => {
    console.log('calling users')
    return pb.collection("users")
        .authWithPassword("webrtc_native", "12345678");
  }
})