from celery import shared_task

from solarflare.ai.machine_learning.ml import ml
from solarflare.ai.preprocessing.pp import pp
from solarflare.ai.data_augmentation.da import da
from solarflare.ai.graph_generation.gg import gg

@shared_task(bind=True)
def celeryTask(self, id, type):

    if type == 'ml':
        ml(id=id)
    elif type == 'da':
        da(id=id)
    elif type == 'pp':
        pp(id=id)
    elif type == 'gg':
        gg(id=id)

    return 'Done'
