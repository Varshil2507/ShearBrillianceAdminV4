import React from 'react';
import { Spinner } from 'reactstrap';

import { showErrorToast } from 'slices/layouts/toastService';

const Loader = (props: any) => {
    // useEffect(() => {
    //     if (props.error) {
    //         showErrorToast(props.error, { position: "top-right", hideProgressBar: false, progress: undefined, toastId: "" });
    //     }
    // }, [props.error]);
    return (
        <React.Fragment>
            <div className="d-flex justify-content-center mx-2 mt-2">
                <Spinner color="primary"> Loading... </Spinner>
            </div>
            {/* {showErrorToast(props.error, { position: "top-right", hideProgressBar: false, progress: undefined, toastId: "" })} */}
        </React.Fragment>
    );
};

export default Loader;
function useEffect(arg0: () => void, arg1: any[]) {
    throw new Error('Function not implemented.');
}

