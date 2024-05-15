import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

const useGroup = () => {
  const [group, setGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [grLoading, setGrLoading] = useState(false);

  const createGroup = async (groupData) => {
    setGrLoading(true);
    try {
      const response = await axiosInstance.post("/groups/create", groupData);
      console.log(response);
      const { data, status } = response;

      if (status === 201) {
        setGroup(data.group);
        setGrLoading(false);
        return true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const getGroup = async (groupId) => {
    setGrLoading(true);
    try {
      const response = await axiosInstance.get(`/groups/get/${groupId}`);
      const { data, status } = response;

      if (status === 200) {
        setGroup(data.group);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const getGroups = async () => {
    setGrLoading(true);
    try {
      const response = await axiosInstance.get("/groups/all");
      const { data, status } = response;
      // console.log("data", data);

      if (status === 200) {
        setGroups(data);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const deleteGroup = async (groupId) => {
    setGrLoading(true);
    try {
      const response = await axiosInstance.delete(`/groups/delete/${groupId}`);
      const { status } = response;

      if (status === 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const updateGroup = async (groupId, groupData) => {
    setGrLoading(true);

    try {
      const response = await axiosInstance.put(
        `/groups/update/${groupId}`,
        groupData
      );
      const { data, status } = response;

      if (status === 200) {
        setGroup(data.group);
        return true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const addMember = async (groupId, memberData) => {
    setGrLoading(true);
    try {
      const response = await axiosInstance.post(
        `/groups/addMembers/${groupId}`,
        memberData
      );
      const { data, status } = response;

      if (status === 200) {
        setGroup(data.group);
        return data.message;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const removeMember = async (groupId, memberData) => {
    setGrLoading(true);
    try {
      const response = await axiosInstance.post(
        `/groups/removeMembers/${groupId}`,
        memberData
      );
      const { data, status } = response;

      if (status === 200) {
        setGroup(data.group);
        return true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const leaveGroup = async (groupId) => {
    setGrLoading(true);
    try {
      const response = await axiosInstance.post(`/groups/leave/${groupId}`);
      const { status } = response;

      if (status === 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  const changeAdmins = async (groupId, memberData, typeChange) => {
    setGrLoading(true);
    try {
      if (typeChange === "makeAdmin") {
        const response = await axiosInstance.post(
          "/groups/make-member-to-admin",
          {
            userId: memberData,
            groupId,
          }
        );
        const { data, status } = response;
        console.log(data, status);

        if (status === 200) {
          return data;
        }
      }
      const response = await axiosInstance.post("/groups/changeAdmins", {
        members: [...memberData],
        typeChange,
        groupId,
      });
      const { data, status } = response;

      if (status === 200) {
        return data;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setGrLoading(false);
    }
  };

  return {
    group,
    groups,
    grLoading,
    createGroup,
    getGroup,
    getGroups,
    deleteGroup,
    updateGroup,
    addMember,
    removeMember,
    leaveGroup,
    changeAdmins,
  };
};

export default useGroup;
