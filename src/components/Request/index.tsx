import * as React from "react";
import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";

export type EmptyObject<T = unknown> = Record<string, T>;

export type HandlersApiType = {
  callApi: (cfg: AxiosRequestConfig) => void;
  onLoad: (obj: PayloadType) => void;
  updateInstance: (obj: AxiosRequestConfig) => void;
};

export type PayloadType = {
  state: EmptyObject;
  handlers: HandlersApiType;
  api: AxiosInstance | null;
  props?: EmptyObject;
};

export type CustomProps = {
  callOnMount: boolean;
  onLoad: (obj: PayloadType) => void;
  config: EmptyObject<AxiosRequestConfig>;
};

export type RequestPropsType = Partial<AxiosRequestConfig> &
  CustomProps & {
    children: (obj: PayloadType) => React.ReactNode;
  } & EmptyObject;

/**
 * @TODO
 * obtener configuración inicial del objeto Axios desde el
 * objeto props
 */
export const useRequest = (props: Partial<RequestPropsType>) => {
  const {
    config = {},
    callOnMount = false,
    onLoad = (...args) => console.log(args),
    ...rest
  } = props;

  const [state, setState] = React.useState<Record<string, unknown>>({
    loading: false,
    data: null,
    response: null,
    initialized: false,
    error: null,
    config
  });

  const [api, setApi] = React.useState<AxiosInstance | null>(null);

  const updateState = (obj: EmptyObject) =>
    setState((prev) => ({
      ...prev,
      ...obj
    }));

  React.useEffect(() => {
    let obj = { initialized: true, config: {} };
    if (config && Object.keys(config).length > 0) {
      obj.config = { ...obj.config, config };
    }
    updateState(obj);
  }, [config]);

  const updateInstance = React.useCallback((cfg: AxiosRequestConfig) => {
    if (cfg && Object.keys(cfg).length > 0) {
      // setApi(() => axios.create(cfg));
      updateState({ config: cfg });
    }
  }, []);

  const callApi = React.useCallback(
    (cfg: AxiosRequestConfig = {}) => {
      updateState({ loading: true });
      if (api !== null && api.request) {
        api
          .request({ ...state.config, cfg })
          .then((resp) => {
            console.log("response api", resp);
            if (resp.status === 200) {
              updateState({
                loading: false,
                data: resp.data
              });
            }
          })
          .catch((error) => {
            if (error) updateState({ error });
            console.log("response api", error);
          });
      }
    },
    [api, state.config]
  );

  React.useEffect(() => {
    if (state.initialized && props.callOnMount) {
      callApi(state.config as AxiosRequestConfig);
    }
  }, [callApi, state.initialized, props.callOnMount, state.config]);

  return React.useMemo(
    () => ({
      handlers: {
        callApi,
        onLoad,
        updateInstance
      },
      api,
      state
    }),
    [state, callApi, api, onLoad, updateInstance]
  );
};

export const Request = (
  props: RequestPropsType
): React.ReactNode | JSX.Element => {
  const { onLoad = () => undefined, children = () => null } = props;
  const { handlers, state, api } = useRequest(props);
  React.useEffect(() => {
    onLoad({ state, handlers, api } as PayloadType);
  }, [state, handlers, api, onLoad]);

  return children({ state, handlers, api });
};

export default Request;
