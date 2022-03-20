import * as React from "react";
import Request, { PayloadType, EmptyObject } from "../../components/Request";

export const HomePage = () => {
  const [req, setReq] = React.useState<PayloadType>();
  const handleLoadRequestComp = (bag: PayloadType) => {
    setReq(bag);
  };

  React.useEffect(() => {
    if (req) {
      req.handlers.callApi({
        url: "/todos/1"
      });
    }
  }, [req]);
  return (
    <div>
      <Request
        config={
          {
            baseURL: "https://jsonplaceholder.typicode.com",
            timeout: 10000,
            onLoad: handleLoadRequestComp,
            Headers: {
              "Content-type": "application/json"
            }
          } as EmptyObject
        }
        callOnMount
      >
        {({ state: { loading, data } }) => (
          <div>
            {loading ? (
              <div>...loading</div>
            ) : (
              <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
          </div>
        )}
      </Request>
    </div>
  );
};

export default HomePage;
