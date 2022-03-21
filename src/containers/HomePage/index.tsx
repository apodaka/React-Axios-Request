import * as React from "react";
import Request, { PayloadType, EmptyObject } from "../../components/Request";

export const HomePage = () => {
  const [req, setReq] = React.useState<PayloadType>();
  const handleLoadRequestComp = React.useCallback((bag: PayloadType) => {
    setReq(bag);
  }, [])

  React.useEffect(() => {
    if (req?.state?.result && req?.state.result !== null) {
      req.handlers.callApi();
    }
  }, [req]);
  return (
    <div>
      <Request
        url="https://jsonplaceholder.typicode.com/todos/1"
        timeout={10000}
        onLoad={handleLoadRequestComp}
      >
        {({ state: { loading, result } }) => (
          <div>
            {loading ? (
              <div>...loading</div>
            ) : (
              <pre>{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        )}
      </Request>
    </div>
  );
};

export default HomePage;
