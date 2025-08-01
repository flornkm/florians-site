import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function Letters() {
  const { data, isLoading } = useQuery({
    queryKey: ["letters"],
    queryFn: ({ signal }) =>
      axios.get("/api/letters", {
        signal,
      }),
  });

  console.log(data);

  return (
    <div>
      <h1>Letters</h1>
      <p>Letters are a great way to communicate with others.</p>
    </div>
  );
}
