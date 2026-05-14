class DemandDomainError(Exception):
    """Exceção base para regras de negócio do domínio de demandas."""


class NoDemandAvailableError(DemandDomainError):
    """Lançada quando não existe demanda disponível para atribuição."""


class InvalidStatusTransitionError(DemandDomainError):
    """Lançada quando uma mudança de status não é permitida."""


class DemandAlreadyAssignedError(DemandDomainError):
    """Lançada quando tentam atribuir uma demanda já atribuída."""


class InvalidStandbyOperationError(DemandDomainError):
    """Lançada quando a operação de standby é inválida."""


class InvalidReassignmentOperationError(DemandDomainError):
    """Lançada quando a operação de reatribuição é inválida."""