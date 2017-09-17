/*global dispatch*/
import axios from "axios"
import * as messages from "./messages"

export function getNamespaces(page, pagesize, search) {
    dispatch({ type: "LOADING_NAMESPACES"})
    const req = axios.get(`/api/v1/terraform/namespace/?page=${page}&page_size=${pagesize}&search=${search}`)
    req.then((res) => {
        dispatch({
            type: "LIST_NAMESPACES",
            payload: {
                namespaces: res.data,
                namespacesPages: res.headers.pages,
                namespacesPage: res.headers.currentpage,
            }
        })
        dispatch({ type: "LOADING_NAMESPACES_DONE" })
    }, messages.handleResponseError)
    return req
}

export function getNamespace(slug) {
    dispatch({ type: "LOADING_NAMESPACES"})
    const req = axios.get(`/api/v1/terraform/namespace/?slug=${slug}`)
    req.then((res) => {
        if (res.data.length > 0){
            dispatch({
                type: "UPDATE_NAMESPACE",
                payload: res.data[0]
            })
        } else {
            messages.error(dispatch, "[Internal Error] Unable to find a namespace for " + slug)
        }
        dispatch({ type: "LOADING_NAMESPACES_DONE" })
    }, messages.handleResponseError)
    return req
}

export function createNamespace(payload) {
    const req = axios.post("/api/v1/terraform/namespace/", payload)
    req.then((res) => {
        dispatch({
            type: "UPDATE_NAMESPACE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function updateNamespace(id, payload) {
    const req = axios.patch(`/api/v1/terraform/namespace/${id}/`, payload)
    req.then((res) => {
        dispatch({
            type: "UPDATE_NAMESPACE",
            payload: res.data
        })
        messages.success(`Successfully Saved Namespace '${res.data.title}'`)
    }, messages.handleResponseError)
    return req
}

export function deleteNamespace(id) {
    const req = axios.delete(`/api/v1/terraform/namespace/${id}/`)
    req.then(() => {
        dispatch({
            type: "DELETE_NAMESPACE",
            payload: id
        })
    }, messages.handleResponseError)
    return req
}

export function addFileToNamespace(payload) {
    const req = axios.post("/api/v1/terraform/file/", payload)
    req.then(() => {
        getNamespace(payload.namespace)
    }, messages.handleResponseError)
    return req
}

export function updateFile(id, payload) {
    const req = axios.patch(`/api/v1/terraform/file/${id}/`, payload)
    req.then((res) => {
        getNamespace(res.data.namespace)
    }, messages.handleResponseError)
    return req
}

export function removeFileFromNamespace(slug, id) {
    const req = axios.delete(`/api/v1/terraform/file/${id}/`)
    req.then(() => {
        getNamespace(slug)
    }, messages.handleResponseError)
    return req
}

export function addTemplateToNamespace(payload) {
    const req = axios.post("/api/v1/terraform/templateinstance/", payload)
    req.then(() => {
        getNamespace(payload.namespace)
    }, messages.handleResponseError)
    return req
}

export function updateTemplateInstance(id, payload) {
    const req = axios.patch(`/api/v1/terraform/templateinstance/${id}/`, payload)
    req.then((res) => {
        getNamespace(res.data.namespace)
    }, messages.handleResponseError)
    return req
}

export function updateTemplateOfTemplateInstance(id) {
    const req = axios.post(`/api/v1/terraform/templateinstance/${id}/update_template/`)
    req.then((res) => {
        getNamespace(res.data.namespace)
    }, messages.handleResponseError)
    return req
}

export function diffTemplateInstance(id) {
    const req = axios.get(`/api/v1/terraform/templateinstance/${id}/diff_latest/`)
    req.then((res) => {
        dispatch({
            type: "LOAD_TEMPLATE_INSTANCE_DIFF",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function removeTemplateFromNamespace(slug, id) {
    const req = axios.delete(`/api/v1/terraform/templateinstance/${id}/`)
    req.then(() => {
        getNamespace(slug)
    }, messages.handleResponseError)
    return req
}

export function getPlanForNamespace(id) {
    const req = axios.get(`/api/v1/terraform/namespace/${id}/plan_live/`)
    req.then((res) => {
        dispatch({
            type: "PLAN_NAMESPACE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function doPlanForNamespace(id) {
    dispatch({type: "CLEAR_PLAN_NAMESPACE"})
    let loopId = setInterval(() => {getPlanForNamespace(id)}, 1000)
    const req = axios.post(`/api/v1/terraform/namespace/${id}/plan/`)
    req.then((res) => {
        clearInterval(loopId)
        dispatch({
            type: "PLAN_NAMESPACE",
            payload: res.data
        })
    }, (err) => {
        clearInterval(loopId)
        messages.handleResponseError(err)
    })
    return req
}

export function getApplyForNamespace(id) {
    const req = axios.get(`/api/v1/terraform/namespace/${id}/apply_live/`)
    req.then((res) => {
        dispatch({
            type: "APPLY_NAMESPACE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function doApplyForNamespace(id, plan_hash) {
    dispatch({type: "CLEAR_APPLY_NAMESPACE"})
    let loopId = setInterval(() => {getApplyForNamespace(id)}, 1000)
    const req = axios.post(`/api/v1/terraform/namespace/${id}/apply/${plan_hash}/`)
    req.then((res) => {
        clearInterval(loopId)
        dispatch({
            type: "APPLY_NAMESPACE",
            payload: res.data
        })
    }, (err) => {
        clearInterval(loopId)
        messages.handleResponseError(err)
    })
    return req
}

export function getStateForNamespace(id) {
    const req = axios.get(`/api/v1/terraform/state/?namespace=${id}`)
    req.then((res) => {
        dispatch({
            type: "UPDATE_STATEFILE",
            payload: res.data[0]
        })
    }, messages.handleResponseError)
    return req
}

export function getExperimentForNamespace(id) {
    const req = axios.get(`/api/v1/terraform/namespace/${id}/experiment_live/`)
    req.then((res) => {
        dispatch({
            type: "EXPERIMENT_NAMESPACE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function doExperimentForNamespace(id, repl_command) {
    dispatch({type: "CLEAR_EXPERIMENT_NAMESPACE"})
    let loopId = setInterval(() => {getExperimentForNamespace(id)}, 1000)
    const req = axios.post(`/api/v1/terraform/namespace/${id}/experiment/`, {"repl_command": repl_command})
    req.then((res) => {
        clearInterval(loopId)
        dispatch({
            type: "EXPERIMENT_NAMESPACE",
            payload: res.data
        })
    }, (err) => {
        clearInterval(loopId)
        messages.handleResponseError(err)
    })
    return req
}

export function lockNamespace(id) {
    const req = axios.post(`/api/v1/terraform/namespace/${id}/lock/`)
    req.then((res) => {
        dispatch({
            type: "UPDATE_NAMESPACE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function unlockNamespace(id) {
    const req = axios.post(`/api/v1/terraform/namespace/${id}/unlock/`)
    req.then((res) => {
        dispatch({
            type: "UPDATE_NAMESPACE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function getTemplates(page, pagesize, search) {
    dispatch({ type: "LOADING_TEMPLATES"})
    const req = axios.get(`/api/v1/terraform/template/?page=${page}&page_size=${pagesize}&search=${search}`)
    req.then((res) => {
        dispatch({
            type: "LIST_TEMPLATES",
            payload: {
                templates: res.data,
                templatesPages: res.headers.pages,
                templatesPage: res.headers.currentpage,
            }
        })
        dispatch({ type: "LOADING_TEMPLATES_DONE" })
    }, messages.handleResponseError)
    return req
}

export function getTemplate(slug) {
    dispatch({ type: "LOADING_TEMPLATES"})
    const req = axios.get(`/api/v1/terraform/template/?slug=${slug}`)
    req.then((res) => {
        if (res.data.length > 0){
            dispatch({
                type: "UPDATE_TEMPLATE",
                payload: res.data[0]
            })
        } else {
            messages.error("[Internal Error] Unable to find a template for " + slug)
        }
        dispatch({ type: "LOADING_TEMPLATES_DONE" })
    }, messages.handleResponseError)
    return req
}

export function createTemplate(payload) {
    const req = axios.post("/api/v1/terraform/template/", payload)
    req.then((res) => {
        dispatch({
            type: "UPDATE_TEMPLATE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function updateTemplate(id, payload) {
    const req = axios.patch(`/api/v1/terraform/template/${id}/`, payload)
    req.then((res) => {
        dispatch({
            type: "UPDATE_TEMPLATE",
            payload: res.data
        })
        messages.success(`Successfully Saved Template '${res.data.title}' to version '${res.data.version}'`)
    }, messages.handleResponseError)
    return req
}

export function renderTemplate(payload) {
    const req = axios.post("/api/v1/terraform/template/render/", payload)
    req.then((res) => {
        dispatch({
            type: "RENDER_TEMPLATE",
            payload: res.data
        })
    }, messages.handleResponseError)
    return req
}

export function deleteTemplate(id) {
    const req = axios.delete(`/api/v1/terraform/template/${id}/`)
    req.then(() => {
        dispatch({
            type: "DELETE_TEMPLATE",
            payload: id
        })
    }, messages.handleResponseError)
    return req
}

