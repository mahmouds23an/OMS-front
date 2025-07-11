/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";

// Orders hooks
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => apiService.getOrders(),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => apiService.getOrderById(id),
    enabled: !!id,
  });
};

export const useClientOrders = (clientId: string) => {
  return useQuery({
    queryKey: ["orders", "client", clientId],
    queryFn: () => apiService.getOrders().then(orders => 
      orders.filter((order: any) => {
        const orderClientId = typeof order.clientId === 'string' ? order.clientId : order.clientId._id;
        return orderClientId === clientId;
      })
    ),
    enabled: !!clientId,
  });
};

export const useUserOrders = (userId: string) => {
  return useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => apiService.getOrders().then(orders => 
      orders.filter((order: any) => order.createdBy === userId)
    ),
    enabled: !!userId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Clients hooks
export const useClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => apiService.getClients(),
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => apiService.getClientById(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

// Users hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => apiService.getUsers(),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => apiService.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

// Analytics hooks
export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiService.getAnalytics(),
  });
};
