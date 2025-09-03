import { Call } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import queryClient, { pb } from "./client";

export const useCalls = () => useQuery({
  queryKey: ['calls'],
  queryFn: async () => {
    return await pb.collection<Call>('calls').getFullList().then(data => data.filter(call => (call.apartment_number === '42' && call.status === 'START')));
  }
})

export const useCallsSubscription = () => {
  useEffect(() => {
    const unsubscribe = pb.collection<Call>('calls').subscribe('*', async ({ action, record }) => {
      queryClient.setQueryData(['calls'], (oldData: any[] = []) => {
        if (action === 'create') {
          return [...oldData, record];
        }
        if (action === 'update') {
          return oldData.map(item => item.id === record.id ? record : item);
        }
        if (action === 'delete') {
          return oldData.filter(item => item.id !== record.id);
        }
        return oldData;
      });
    });

    return () => {
      unsubscribe.then(fn => fn());
    }
  }, [queryClient])
}