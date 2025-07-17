import { QueryClient } from "@tanstack/react-query";
import PB from "pocketbase";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

export const pb = new PB('https://rasult22.pockethost.io')
export default queryClient;