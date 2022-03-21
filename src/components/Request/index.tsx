import * as React from "react";
import isPlainObject from 'lodash.isplainobject'
import axios, { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
// import isPlainObject from "lodash.isplainobject";

export type EmptyObject<T = unknown> = Record<string, T>;

export type HandlersApiType = {
  callApi: (cfg?: AxiosRequestConfig | {}) => void;
  onLoad: (obj: PayloadType) => void;
  // updateInstance: (obj: AxiosRequestConfig) => void;
};



export type CustomProps = {
  callOnMount?: boolean;
  onLoad?: (obj: PayloadType) => void;
  config?: EmptyObject<AxiosRequestConfig>;
};


export type RequestPropsType = Partial<AxiosRequestConfig> &
  CustomProps & {
    /** Function that includes the state of the API REST call and pass down to the childrens component */
    children: ((obj: PayloadType) => React.ReactNode) | React.ReactNode;
  } & EmptyObject;

type StateType<T = unknown> = {
  /** Incicates when a request is in process */
  loading: boolean;
  /** Holds the result of the Axios request objetct
   * @example
   * axios(...).then(reponse => response.data ) // holds this prop
   */
  result: AxiosResponse<T> | null;
  /** Holds the result of the Axios request objetct */
  response: AxiosResponse<T> | null;
  /** Indicates when the component has been loaded for the first time */
  initialized: boolean;
  /** Holds an error when the API call crashes */
  error: AxiosResponse<T> | AxiosError<T> | null;
  /** Object that represents the interface AxiosObject for configure requests */
  config: AxiosRequestConfig | {};
}

export type PayloadType = {
  state: StateType;
  handlers: HandlersApiType;
  // api: AxiosInstance | null;
  props?: EmptyObject;
};

/**
 * @TODO
 * obtener configuración inicial del objeto Axios desde el
 * objeto props
 */
export const useRequest = (props: Partial<RequestPropsType>) => {
  const {
    config              = {},
    url                 = '',
    callOnMount         = false,
    method              = 'GET',
    data                = {},
    headers             = {},
    onLoad              = (...args) => console.log(args),
    ...rest
  } = props;

  const [state, setState] = React.useState<StateType<EmptyObject>>({
    loading: false,
    result: null,
    response: null,
    initialized: false,
    error: null,
    config: {}
  });

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
    updateState({ config: obj });
  }, []);

  const setHeaders = React.useCallback((headers) => {
      const DEFAULT_HEADERS = {
        'Content-Type': 'application/json',
      }
      const hdrs = {
        ...DEFAULT_HEADERS,
        ...headers
      }
      updateState({
        headers: hdrs
      })
  }, [])
  // const updateInstance = React.useCallback((cfg: AxiosRequestConfig) => {
  //   if (cfg && Object.keys(cfg).length > 0) {
  //     // setApi(() => axios.create(cfg));
  //     updateState({ config: cfg });
  //   }
  // }, []);

  const callApi = React.useCallback(
    (cfg: AxiosRequestConfig = {}) => {
      const makeCall = async () => {
        try {
         updateState({ loading: true });
         const axiosCfg = {
           url,
           method,
           data,
           headers,
           ...(isPlainObject(state.config) ? state.config : {}),
           ...cfg
         }
         const resp = await axios(axiosCfg)
         if (resp.status === 200) {
           updateState({
             loading: false,
             result: resp.data,
             response: resp,
           })
         } else {
           updateState({
             loading: false,
             response: resp
           })
         }
         console.log('resp')
        } catch (error) {
          updateState({
            loading: false,
            error,
          })
        }
       }
       makeCall()
    }
    ,
    [state]
  );

  return React.useMemo(
    () => ({
      handlers: {
        callApi,
        onLoad,
        // updateInstance
      },
      state
    }),
    [state,
      callApi,
      onLoad,
      // updateInstance
    ]
  );
};

/**
 * Component that makes an API call and send data down with the function property children
 */
export const Request = (
  props: RequestPropsType
): JSX.Element => {
  const {
    onLoad = () => undefined,
    children
  } = props;
  const {
    handlers,
    state
  } = useRequest(props);
  
  React.useEffect(() => {
    onLoad({ state, handlers });
  }, []);

  return (
    <>
    {typeof children === 'function' ?
      children({ state, handlers }) : children
    }
    </>
  )
};

export default Request;
