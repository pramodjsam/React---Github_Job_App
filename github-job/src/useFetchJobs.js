import {useReducer,useEffect} from 'react';
import axios from 'axios'

function reducer(state,action){
	switch(action.type){
		case "MAKE_REQUEST":
			return {loading:true,jobs:[]}
		case "GET_DATA":
			return {...state,loading:false,jobs:action.payload.jobs}
		case "ERROR":
			return {...state,loading:false,error:action.payload.error,jobs:[]}
		case 'HAS_NEXT_PAGE':
			return {...state, hasNextPage:action.payload.hasNextPage}
		default:
			return state;
	}
}

const BASE_URL='https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json';

function useFetchJobs(params,page){
	const [state,dispatch]=useReducer(reducer,{jobs:[],loading:true})
	useEffect(()=>{
		const cancelToken=axios.CancelToken.source();
		dispatch({type:"MAKE_REQUEST"});
		axios.get(BASE_URL,{
			cancelToken:cancelToken.token,
			params:{markdown:true,page:page,...params}
		}).then(res=>{
			dispatch({type:"GET_DATA",payload:{jobs:res.data}});
			// console.log(res.data);
		}).catch(e=>{
			if(axios.isCancel(e)) return
			dispatch({type:"ERROR",payload:{error:e}})
		})
		const cancelToken2=axios.CancelToken.source();
		axios.get(BASE_URL,{
			cancelToken2:cancelToken.token,
			params:{markdown:true,page:page,...params}
		}).then(res=>{
			dispatch({type:"HAS_NEXT_PAGE",payload:{hasNextPage:res.data.length!==0}});
			// console.log(res.data);
		}).catch(e=>{
			if(axios.isCancel(e)) return
			dispatch({type:"ERROR",payload:{error:e}})
		})
		return ()=>{
			cancelToken.cancel();
			cancelToken2.cancel();
		}
	},[params,page])
	return state 
}

export default useFetchJobs;