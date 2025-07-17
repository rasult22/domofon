import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import queryClient, { pb } from "./client";

export const useIceServers = () => useQuery({
  queryKey: ['ice_servers'],
  queryFn: () => {
    return pb.collection("ice_servers").getFullList<{
      id: string,
      url: string
    }>();
  }
})

export const useCalls = () => useQuery({
  queryKey: ['calls'],
  queryFn: async () => {
    return await pb.collection("calls").getFullList<{
      id: string,
      user_id: string,
      offer: any,
      answer: any,
      receiver_id: string,
      status: string
    }>().then(data => data.filter(call => call.receiver_id === 'apmnu73db9u8wsa'));
  }
})

export const useCallsSubscription = () => {
  useEffect(() => {
    const unsubscribe = pb.collection('calls').subscribe('*', async ({ action, record }) => {
      console.log(action, record, 'got new event')
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