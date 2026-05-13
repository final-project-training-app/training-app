import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTrainers, updateSelectedTrainer, trainerKeys, type Trainer } from '../api/trainerService';

export function useTrainers() {
  return useQuery<Trainer[]>({
    queryKey: trainerKeys.list(),
    queryFn: fetchTrainers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSelectedTrainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trainerId: string) => updateSelectedTrainer(trainerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: trainerKeys.list() });
    },
  });
}
